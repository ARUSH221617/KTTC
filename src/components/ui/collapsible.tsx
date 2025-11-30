"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Root Collapsible component.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Collapsible.
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * Trigger for the Collapsible.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Trigger.
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

/**
 * Content of the Collapsible.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Content.
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
