
export type ResourceType = 'video' | 'article' | 'project';

export interface Resource {
  type: ResourceType;
  title: string;
  link: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
}

export interface RoadmapStage {
  id: string;
  title: string;
  nodes: RoadmapNode[];
}

export type ParsedRoadmap = RoadmapStage[];