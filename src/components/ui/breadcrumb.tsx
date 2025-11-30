import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Root Breadcrumb navigation component.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered Breadcrumb navigation.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/**
 * List container for breadcrumb items.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered list.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * Individual item in the breadcrumb list.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered item.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * Interactive link within a breadcrumb item.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @param {boolean} props.asChild - Whether to render as a child component.
 * @returns {JSX.Element} The rendered link.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/**
 * Static page indicator (current page) within a breadcrumb item.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered page indicator.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

/**
 * Separator between breadcrumb items.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @param {React.ReactNode} props.children - Custom separator content.
 * @returns {JSX.Element} The rendered separator.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

/**
 * Ellipsis indicator for collapsed breadcrumb items.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered ellipsis.
 */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
