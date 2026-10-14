import {useState} from 'react';
import type {z} from 'zod';
import {useSession} from '@/shared/session/session';
export function useAdminDraft<T>(name:string,schema:z.ZodType<T>,initial:T){
 const owner=useSession().user?.id??0,key=`aihn.admin-draft.v1.${owner}.${name}`;
 const [draft,setDraft]=useState<{input:T;review:boolean}>(()=>{try{const raw:unknown=JSON.parse(sessionStorage.getItem(key)??'null');if(raw&&typeof raw==='object'&&'input'in raw&&'review'in raw){const parsed=schema.safeParse(raw.input);if(parsed.success)return{input:parsed.data,review:raw.review===true};}}catch{/* unavailable storage */}return{input:initial,review:false};});
 const [stored,setStored]=useState(true);
 function write(next:{input:T;review:boolean}){setDraft(next);try{sessionStorage.setItem(key,JSON.stringify(next));setStored(true);}catch{setStored(false);}}
 return { ...draft, stored, edit:(input:T)=>write({...draft,input}), setReview:(value:boolean)=>write({...draft,review:value}), replace:(input:T)=>write({input,review:false}) };
}
