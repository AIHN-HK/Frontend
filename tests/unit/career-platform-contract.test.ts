import { describe,it,expect } from 'vitest';
import { careerSchema,profileSchema,recommendationSchema } from '@/modules/career-platform/model/contracts';
describe('sourced career and explanation contracts',()=>{
  const recommendation={careerId:'15-1252.00',title:'Fixture',sourceVersion:'O*NET 31.0',sourceUrl:'https://www.onetonline.org/link/summary/15-1252.00',score:80,skillCoverage:0,components:{riasec:80,skills:null,interests:null},contributions:[{key:'riasec',value:80,weight:1,contribution:80}],missing:['skills','interests'],gaps:[]};
  it('rejects inconsistent explanation totals and unsafe provenance links',()=>{
    expect(recommendationSchema.safeParse(recommendation).success).toBe(true);
    expect(recommendationSchema.safeParse({...recommendation,score:90}).success).toBe(false);
    expect(recommendationSchema.safeParse({...recommendation,sourceUrl:'javascript:alert(1)'}).success).toBe(false);
    expect(recommendationSchema.safeParse({...recommendation,contributions:[{key:'riasec',value:70,weight:1,contribution:80}]}).success).toBe(false);
  });
  it('preserves explicit zero ratings while rejecting interests outside their self-rating scale',()=>{
    const profile={userId:71,revision:0,skills:[{skillId:'programming',level:0}],interests:null,targetCareerId:null};
    expect(profileSchema.parse(profile).skills[0]?.level).toBe(0);
    expect(profileSchema.safeParse({...profile,interests:{R:0,I:6,A:0,S:0,E:0,C:0}}).success).toBe(false);
  });
  it('requires source occupation vectors to use the documented 1 to 7 range',()=>{
    const career={id:'15-1252.00',title:'Fixture',description:'Fixture',sourceVersion:'O*NET 31.0',sourceUrl:recommendation.sourceUrl,active:true,revision:1,skills:[],riasec:{R:1,I:8,A:2,S:1,E:2,C:3}};
    expect(careerSchema.safeParse(career).success).toBe(false);
  });
});
