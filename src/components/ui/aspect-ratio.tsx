"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * Component to maintain a specific aspect ratio for its content.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Aspect Ratio component.
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
