export type TexturePainter = (ctx: CanvasRenderingContext2D, size: number) => void;
export type MaterialTexturePainter = (
  ctx: CanvasRenderingContext2D,
  size: number,
  meta: { kind?: string; variant?: string; baseHex?: string; charId?: string | number },
) => void;

export type CharacterLoaders = {
  modelConfig?: Record<string, unknown>;
  buildModel?: (ctx: any) => any;
  buildWeapon?: (hand: any, ctx: any) => void;
  attachSkinGear?: (ctx: any) => void;
  paintTexture?: TexturePainter;
  paintMaterialTexture?: MaterialTexturePainter;
  loadVfx?: () => void;
  tick?: (state: any, player: any, dt: number) => void;
};

export class BaseCharacter {
  [key: string]: any;

  readonly data: Record<string, any>;
  readonly loaders: CharacterLoaders;

  constructor(data: Record<string, any>, loaders: CharacterLoaders = {}) {
    Object.assign(this, data);
    this.data = data;
    this.loaders = loaders;
  }

  get modelConfig() {
    return this.loaders.modelConfig || null;
  }

  buildModel(ctx: any) {
    return this.loaders.buildModel ? this.loaders.buildModel(ctx) : null;
  }

  buildWeapon(hand: any, ctx: any) {
    if (this.loaders.buildWeapon) this.loaders.buildWeapon(hand, ctx);
  }

  attachSkinGear(ctx: any) {
    if (this.loaders.attachSkinGear) this.loaders.attachSkinGear(ctx);
  }

  paintTexture(ctx: CanvasRenderingContext2D, size: number) {
    if (this.loaders.paintTexture) this.loaders.paintTexture(ctx, size);
  }

  paintMaterialTexture(
    ctx: CanvasRenderingContext2D,
    size: number,
    meta: { kind?: string; variant?: string; baseHex?: string; charId?: string | number } = {},
  ) {
    if (this.loaders.paintMaterialTexture) this.loaders.paintMaterialTexture(ctx, size, meta);
  }

  loadVfx() {
    if (this.loaders.loadVfx) this.loaders.loadVfx();
  }

  tick(state: any, player: any, dt: number) {
    if (this.loaders.tick) this.loaders.tick(state, player, dt);
  }
}
