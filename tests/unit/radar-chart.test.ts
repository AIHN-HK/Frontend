import { expect, test } from 'vitest';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import { RiasecBar } from '@/shared/ui/ce/RiasecBar';
import { radarVertices } from '@/shared/ui/ce/radar.model';
import type { RadarValues } from '@/shared/ui/ce/radar.model';

const zero: RadarValues = { R:0,I:0,A:0,S:0,E:0,C:0 };
test('zero has exact finite center vertices and invalid percentages are rejected', () => {
  expect(radarVertices(zero)).toBe(Array(6).fill('75,75').join(' '));
  for (const R of [NaN, Infinity, -1, 101]) expect(() => radarVertices({ ...zero, R })).toThrow();
});
test('incomplete data never draws a complete personal radar and charts have independent accessible IDs', () => {
  const incomplete = renderToStaticMarkup(createElement(RadarChart, { values:{ ...zero, I:null } }));
  expect(incomplete).not.toContain('data-radar-values');
  expect(incomplete).toContain('không có dữ liệu');
  const pair = renderToStaticMarkup(createElement(Fragment, null, createElement(RadarChart,{values:zero}),createElement(RadarChart,{values:zero})));
  const titles = [...pair.matchAll(/<title id="([^"]+)"/g)].map(match => match[1]);
  expect(new Set(titles).size).toBe(2);
});
test('bar target is readable before effects and missing data does not manufacture a fill', () => {
  const props = { code:'I' as const, label:'Nghiên cứu', valueLabel:'4/8 câu Có', percentage:50 };
  expect(renderToStaticMarkup(createElement(RiasecBar,props))).toContain('width:50%');
  expect(renderToStaticMarkup(createElement(RiasecBar,{...props,percentage:null}))).not.toContain('data-ce-score-fill');
});
