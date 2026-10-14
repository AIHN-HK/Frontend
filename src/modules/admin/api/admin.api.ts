import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { useSession } from '@/shared/session/session';
export function parseAdminResponse<T>(value:unknown,schema:z.ZodType<T>):T {
 if(!value||typeof value!=='object'||!('status' in value)||value.status!==200||!('data' in value))throw new ApiError('configuration','Dữ liệu quản trị không hợp lệ.');
 const result=schema.safeParse(value.data);if(!result.success)throw new ApiError('configuration','Dữ liệu quản trị không hợp lệ.');return result.data;
}
export function useAdminQuery<T>(key:readonly unknown[],path:string,schema:z.ZodType<T>,enabled=true){
 const current=useSession(),http=useHttpClient(),client=useQueryClient(),scope=['admin',current.user?.id??0,current.revision];
 return useQuery({queryKey:[...scope,...key],queryFn:async({signal})=>{try{return parseAdminResponse((await http.get<unknown>(path,{signal})).data,schema);}catch(error){if(error instanceof ApiError&&error.status===403)client.setQueryData([...scope,'identity'],null);throw error;}},enabled:current.status==='authenticated'&&enabled,retry:false,staleTime:0,refetchOnWindowFocus:false});
}
