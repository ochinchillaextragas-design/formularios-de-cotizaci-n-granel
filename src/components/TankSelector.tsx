import { tankCapacities } from '../data/catalog'
import { Section } from './Section'
export function TankSelector({ capacity, onChange }:{capacity:string;onChange:(v:string)=>void}) { return <Section title="🛢️ Selector de Tanque"><div className="tank-options">{tankCapacities.map(t=><button type="button" className={capacity===t.value?'selected':''} key={t.value} onClick={()=>onChange(t.value)}>{t.label}</button>)}</div></Section> }
