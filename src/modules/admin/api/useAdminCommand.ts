import {useEffect,useRef,useState} from 'react';
import type {z} from 'zod';
import {useQueryClient} from '@tanstack/react-query';
import {useHttpClient} from '@/shared/api/api-context';
import {ApiError} from '@/shared/api/api-error';
import {session,useSession} from '@/shared/session/session';
export function useAdminCommand(){
 const http=useHttpClient(),client=useQueryClient(),scope=useSession(),pending=useRef(false),abort=useRef<AbortController|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>()=>abort.current?.abort(),[]);
 async function send<T>(method:'POST'|'PATCH'|'PUT',path:string,input:unknown,schema:z.ZodType<T>){
  if(pending.current)throw new ApiError('configuration','Yêu cầu đang được xử lý.');
  const valid=()=>session.read().user?.id===scope.user?.id&&session.read().revision===scope.revision;
  if(!valid())throw new ApiError('session-changed','Phiên đã thay đổi.');
  pending.current=true;setBusy(true);abort.current=new AbortController();
  try{const response=await http.request<unknown>({method,url:path,data:input,signal:abort.current.signal});if(!valid())throw new ApiError('session-changed','Phiên đã thay đổi.',undefined,true);
   const envelope=response.data;if(!envelope||typeof envelope!=='object'||!('status'in envelope)||envelope.status!==response.status||!('data'in envelope)||![200,201].includes(response.status))throw new ApiError('configuration','Chưa xác nhận kết quả lưu.',undefined,true);
   const parsed=schema.safeParse(envelope.data);if(!parsed.success)throw new ApiError('configuration','Chưa xác nhận kết quả lưu.',undefined,true);return parsed.data;
  }catch(error){if(valid()&&error instanceof ApiError&&error.status===403)client.setQueryData(['admin',scope.user?.id,scope.revision,'identity'],null);throw error;}finally{pending.current=false;setBusy(false);}
 }
 return{send,busy};
}
