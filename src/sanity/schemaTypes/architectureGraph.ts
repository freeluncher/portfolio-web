import { defineArrayMember, defineField, defineType } from 'sanity';
import { ComponentIcon, DocumentIcon, LinkIcon } from '@sanity/icons';
import ArchitectureGraphInput from '../components/ArchitectureGraphInput';

export const architectureGraphNodeType = defineType({
	name: 'architectureGraphNode',
	title: 'Architecture Graph Node',
	type: 'object',
	icon: DocumentIcon,
	fields: [
		defineField({
			name: 'id',
			title: 'Node ID',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'kind',
			title: 'Kind',
			type: 'string',
			options: {
				list: [
					{ title: 'Architecture Node', value: 'architecture' },
					{ title: 'Detail Node', value: 'detail' },
				],
				layout: 'radio',
			},
			initialValue: 'architecture',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'label',
			title: 'Label',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'subtitle',
			title: 'Subtitle',
			type: 'string',
		}),
		defineField({
			name: 'details',
			title: 'Details',
			type: 'text',
			rows: 4,
		}),
		defineField({
			name: 'position',
			title: 'Position',
			type: 'object',
			fields: [
				defineField({ name: 'x', title: 'X', type: 'number' }),
				defineField({ name: 'y', title: 'Y', type: 'number' }),
			],
		}),
	],
});

export const architectureGraphEdgeType = defineType({
	name: 'architectureGraphEdge',
	title: 'Architecture Graph Edge',
	type: 'object',
	icon: LinkIcon,
	fields: [
		defineField({
			name: 'id',
			title: 'Edge ID',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'source',
			title: 'Source Node ID',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'target',
			title: 'Target Node ID',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'label',
			title: 'Label',
			type: 'string',
		}),
		defineField({
			name: 'animated',
			title: 'Animated',
			type: 'boolean',
			initialValue: true,
		}),
	],
});

export const architectureGraphType = defineType({
	name: 'architectureGraph',
	title: 'Architecture Graph',
	type: 'object',
	icon: ComponentIcon,
	components: {
		input: ArchitectureGraphInput,
	},
	fields: [
		defineField({
			name: 'nodes',
			title: 'Nodes',
			type: 'array',
			of: [defineArrayMember({ type: 'architectureGraphNode' })],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: 'edges',
			title: 'Edges',
			type: 'array',
			of: [defineArrayMember({ type: 'architectureGraphEdge' })],
		}),
	],
});