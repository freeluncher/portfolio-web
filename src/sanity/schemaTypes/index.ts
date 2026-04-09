import { type SchemaTypeDefinition } from "sanity";
import { postType } from "./post";
import { caseStudyType } from "./caseStudy";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [postType, caseStudyType],
};
