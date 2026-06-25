// 技能說明清單：以「角色圖鑑.md」為單一來源（getCodexEntry），解析不到時 fallback 至程式內既有欄位。
// 選角詳情面板與練功房共用，確保兩處說明永遠一致（沿用 .skill-* 既有樣式）。

import { getCodexEntry, type SkillSlot } from '../utils/characterCodex';
import type { CharacterMeta, SkillMeta } from '../types';

const SKILL_SLOTS: SkillSlot[] = ['basic', 'skill1', 'skill2', 'ultimate'];

/** 各槽位顯示的按鍵字（依操作配置；練功房用預設 J/K/L/;）。 */
export interface SkillKeyDisplay {
  basic: string;
  skill1: string;
  skill2: string;
  ultimate: string;
}

function actionTypeLabel(type?: string) {
  switch (type) {
    case 'projectile': return '投射物';
    case 'melee': return '近戰';
    case 'dash': return '衝刺';
    case 'blink': return '瞬移';
    case 'zone': return '區域';
    case 'buff': return '增益';
    case 'star_orbit_cannon': return '星砲';
    case 'star_orbit_guard': return '增益';
    case 'star_orbit_burst': return '大絕';
    case 'samurai_iaijutsu': return '奧義';
    default: return type;
  }
}

function secondsLabel(value?: number) {
  return typeof value === 'number' ? `${value}s` : undefined;
}

export function SkillCodexList({ char, skillDisplay }: { char: CharacterMeta; skillDisplay: SkillKeyDisplay }) {
  // 圖鑑（角色圖鑑.md）以數字 id 為鍵；角色的 order 保留該對照（= 舊數字 id）。
  const codex = char.order != null ? getCodexEntry(char.order) : null;
  const evade = char.evade as (SkillMeta & { cd?: number }) | undefined;

  return (
    <div className="skill-list">
      {SKILL_SLOTS.map((slot) => {
        const cs = codex?.skills.find((s) => s.slot === slot);
        const fallback = char[slot] as SkillMeta | undefined;
        const name = cs?.name ?? fallback?.name;
        if (!name) return null;
        const type = cs?.type ?? actionTypeLabel(fallback?.type);
        const cooldown = cs?.cooldown ?? secondsLabel(fallback?.cd);
        const mana = cs?.mana ?? (typeof fallback?.manaCost === 'number' ? String(fallback.manaCost) : undefined);
        const explain = cs?.explain ?? fallback?.desc;
        return (
          <div className="skill-row" key={slot}>
            <span className="skill-key">{skillDisplay[slot]}</span>
            <div className="skill-body">
              <div className="skill-head">
                <span className="skill-name">{name}</span>
                {slot === 'ultimate' && <span className="skill-tag ult">大絕</span>}
                {type && <span className="skill-tag">{type}</span>}
                {cooldown && cooldown !== '—' && <span className="skill-tag">冷卻 {cooldown}</span>}
                {mana && mana !== '—' && <span className="skill-tag">魔力 {mana}</span>}
              </div>
              {explain && <div className="skill-explain">{explain}</div>}
            </div>
          </div>
        );
      })}
      {evade && (
        <div className="skill-row">
          <span className="skill-key">Space</span>
          <div className="skill-body">
            <div className="skill-head">
              <span className="skill-name">{evade.name}</span>
              <span className="skill-tag">閃避</span>
              {evade.cd ? <span className="skill-tag">冷卻 {evade.cd}s</span> : null}
            </div>
            <div className="skill-explain">短暫無敵位移，可閃避攻擊、拉開距離。</div>
          </div>
        </div>
      )}
    </div>
  );
}
