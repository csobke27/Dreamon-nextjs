import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Dreamon')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      S.listItem()
        .title('FAQ')
        .child(
          S.documentTypeList('faq')
            .title('FAQs')
            .defaultOrdering([
              {field: 'isActive', direction: 'desc'},
              {field: 'order', direction: 'asc'},
            ]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'author', 'faq'].includes(item.getId()!),
      ),
    ])
