declare module 'supercluster' {
  export interface PointFeature {
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  export interface ClusterFeature {
    type: 'Feature';
    properties: {
      cluster: true;
      cluster_id: number;
      point_count: number;
      [key: string]: any;
    };
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  export interface Options {
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    extent?: number;
    nodeSize?: number;
  }

  export default class SuperCluster {
    constructor(options?: Options);
    load(points: PointFeature[]): this;
    getClusters(bbox: [number, number, number, number], zoom: number): (PointFeature | ClusterFeature)[];
    getClusterExpansionZoom(clusterId: number): number;
  }
}
