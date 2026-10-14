import {z} from 'zod';
import {idSchema} from '../../model/contracts';
export const studentSchema=z.object({id:idSchema,fullname:z.string(),email:z.string(),class:z.number().int().nullable(),phone:z.string().nullable(),address:z.string().nullable(),gender:z.string().nullable(),yob:z.string(),createdAt:z.string()});
export const studentsPageSchema=z.object({items:z.array(studentSchema),total:z.number().int().nonnegative(),page:z.number().int().positive(),limit:z.number().int().min(1).max(50)});
export function readListParams(params:URLSearchParams){const positive=(key:string,fallback:number,max:number)=>{const value=Number(params.get(key));return Number.isSafeInteger(value)&&value>=1&&value<=max?value:fallback;};return{q:(params.get('q')??'').trim().slice(0,100),page:positive('page',1,1_000_000),limit:positive('limit',20,50)};}
export function writeListParams(value:ReturnType<typeof readListParams>){const params=new URLSearchParams();if(value.q)params.set('q',value.q);params.set('page',String(value.page));params.set('limit',String(value.limit));return params;}
export function readStudentId(value:string|undefined){if(!value||!/^\d+$/.test(value))return null;const id=Number(value);return Number.isSafeInteger(id)&&id>0?id:null;}
