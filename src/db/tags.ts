import { asc, eq, sql } from 'drizzle-orm';

import { tags } from './schema';
import type { Db, TagRow } from './types';

//~ -----------------------------------------------
//~ Tags.  Positions are 1-based and kept contiguous.
//~ -----------------------------------------------
export const selectTags = (db: Db): TagRow[] =>
  db.select().from(tags).orderBy(asc(tags.position)).all();

export const insertTag = (db: Db, id: string, name: string) => {
  db.insert(tags)
    .values({
      id,
      name,
      position: sql`(select coalesce(max(${tags.position}), 0) + 1 from ${tags})`,
    })
    .run();
};

export const renameTag = (db: Db, tagId: string, name: string) => {
  db.update(tags).set({ name }).where(eq(tags.id, tagId)).run();
};

// show_tags rows are removed by ON DELETE CASCADE
export const deleteTag = (db: Db, tagId: string) => {
  db.transaction((tx) => {
    tx.delete(tags).where(eq(tags.id, tagId)).run();
    renumber(
      tx as unknown as Db,
      selectTags(tx as unknown as Db).map((tag) => tag.id)
    );
  });
};

//~ Reorder to match tagIdOrder.  Ids not in the list keep their relative order after it.
export const reorderTags = (db: Db, tagIdOrder: string[]) => {
  db.transaction((tx) => {
    const existing = selectTags(tx as unknown as Db).map((tag) => tag.id);
    const known = new Set(existing);
    const ordered = tagIdOrder.filter((id) => known.has(id));
    const rest = existing.filter((id) => !ordered.includes(id));
    renumber(tx as unknown as Db, [...ordered, ...rest]);
  });
};

const renumber = (db: Db, orderedIds: string[]) => {
  orderedIds.forEach((id, index) => {
    db.update(tags)
      .set({ position: index + 1 })
      .where(eq(tags.id, id))
      .run();
  });
};
