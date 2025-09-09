/**
 * @fileoverview Shared analyzer types
 */

export interface DocPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: any;
  type: string;
  published: boolean;
  order: number;
}
