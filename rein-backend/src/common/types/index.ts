export type ResourceType = 'video' | 'article' | 'project';

export interface Resource {
  type: ResourceType;
  title: string;
  link: string;
}

export interface ResolutionNode {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
}

export interface ResolutionStage {
  id: string;
  title: string;
  nodes: ResolutionNode[];
}

export type ParsedResolution = ResolutionStage[];
