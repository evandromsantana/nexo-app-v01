import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const onProposalCompleted = functions.firestore
  .document("proposals/{proposalId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the status changed to 'completed'
    if (before.status !== "completed" && after.status === "completed") {
      const proposerId = after.proposerId; // The learner
      const recipientId = after.recipientId; // The teacher
      const costInMinutes = after.costInMinutes; // Get cost from the proposal

      // Validate costInMinutes
      if (!costInMinutes || typeof costInMinutes !== 'number' || costInMinutes <= 0) {
        functions.logger.error(
          `Invalid costInMinutes (${costInMinutes}) for proposal: ${context.params.proposalId}`
        );
        return;
      }

      const proposerRef = db.collection("users").doc(proposerId);
      const recipientRef = db.collection("users").doc(recipientId);

      try {
        // Use a transaction to ensure atomic update
        await db.runTransaction(async (transaction) => {
          const proposerDoc = await transaction.get(proposerRef);
          const recipientDoc = await transaction.get(recipientRef);

          if (!proposerDoc.exists || !recipientDoc.exists) {
            throw new Error("One or both users not found");
          }

          const proposerData = proposerDoc.data();
          const recipientData = recipientDoc.data();

          const newProposerBalance =
                (proposerData?.timeBalance || 0) - costInMinutes;
          const newRecipientBalance =
                (recipientData?.timeBalance || 0) + costInMinutes;

          // Ensure proposer has enough balance
          if (newProposerBalance < 0) {
            throw new Error("Proposer has insufficient time balance.");
          }

          transaction.update(proposerRef, {
            timeBalance: newProposerBalance,
          });
          transaction.update(recipientRef, {
            timeBalance: newRecipientBalance,
          });
        });

        functions.logger.log(
          `Time transfer successful for proposal: ${context.params.proposalId}`,
        );
      } catch (error) {
        functions.logger.error(
          "Time transfer failed for proposal: ",
          context.params.proposalId,
          error,
        );
      }
    }
    return null;
  });
