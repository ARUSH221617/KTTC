import { textArtifact } from "./artifacts/text";
import { codeArtifact } from "./artifacts/code";

export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
];

export type ArtifactKind = (typeof artifactDefinitions)[number]["kind"];
