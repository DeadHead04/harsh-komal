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

test('guestbook pages expose all wishes with stable ordering, literal search and public fields', () => {
 const store=createWishStore(':memory:');
 try {
  for(let i=0;i<26;i++) store.add({id:`wish-${String(i).padStart(2,'0')}`,name:i===13?'Asha & Family':'Guest '+i,message:i===13?'100% love_ and happiness!':'A beautiful beginning',visitorHash:'visitor-'+i,createdAt:100000+Math.floor(i/2)});
  const first=store.page();
  assert.equal(first.total,26); assert.equal(first.pages,3); assert.equal(first.wishes.length,12);
  const all=[...first.wishes,...store.page({page:2}).wishes,...store.page({page:3}).wishes];
  assert.equal(new Set(all.map(wish=>wish.id)).size,26);
  assert.equal(all[0].id,'wish-25'); assert.equal(all.at(-1).id,'wish-00');
  assert.equal(store.page({order:'oldest'}).wishes[0].id,'wish-00');
  assert.equal(store.page({query:'asha'}).matched,1);
  assert.equal(store.page({query:'%'}).matched,1);
  assert.equal(store.page({query:'_'}).matched,1);
  assert.equal(store.page({query:"' OR 1=1 --"}).matched,0);
  assert.equal(store.page({page:999}).page,3);
  assert.equal(store.page({page:NaN}).page,1);
  assert.deepEqual(Object.keys(first.wishes[0]).sort(),['createdAt','id','message','name']);
 } finally {store.close();}
});

test('English translations persist separately and never replace original wishes', () => {
 const folder=mkdtempSync(join(tmpdir(),'harsh-komal-translations-'));
 let store=createWishStore(join(folder,'wishes.sqlite'));
 try {
  const wish={id:'translation-test',name:'Лира',message:'С любовью!',visitorHash:'visitor-translation',createdAt:100000};
  store.add(wish);
  const translation={name:'Lira',message:'With love!',language:'Russian'};
  store.saveTranslation(wish.id,translation);
  store.saveTranslation(wish.id,{...translation,message:'Should not overwrite cached translation'});
  store.close(); store=createWishStore(join(folder,'wishes.sqlite'));
  assert.deepEqual({...store.translation(wish.id)},translation);
  assert.equal(store.get(wish.id).message,wish.message);
  assert.equal(store.get(wish.id).name,wish.name);
  assert.equal(store.page().total,1);
 } finally {store.close();rmSync(folder,{recursive:true,force:true});}
});
