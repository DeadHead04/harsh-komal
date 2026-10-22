import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWishStore } from '../lib/wish-store.mjs';
test('wishes persist on disk, retries are idempotent, and rate limits are per visitor',()=>{
 const folder=mkdtempSync(join(tmpdir(),'harsh-komal-'));
 let store=createWishStore(join(folder,'wishes.sqlite'));
 try {
  const wish={id:'test-1',name:'Test Guest',message:'Best wishes!',visitorHash:'visitor-a',createdAt:100000};
  assert.equal(store.add(wish),'created');
  assert.equal(store.add(wish),'duplicate');
  assert.equal(store.add({...wish,id:'test-2'}),'limited');
  assert.equal(store.add({...wish,id:'test-3',visitorHash:'visitor-b'}),'created');
  assert.equal(store.add({...wish,id:'test-4',createdAt:160001}),'created');
  store.close(); store=createWishStore(join(folder,'wishes.sqlite'));
  assert.equal(store.list().length,3);
  assert.equal(store.list()[0].id,'test-4');
  assert.equal('visitorHash' in store.list()[0],false);
 } finally { store.close(); rmSync(folder,{recursive:true,force:true}); }
});
