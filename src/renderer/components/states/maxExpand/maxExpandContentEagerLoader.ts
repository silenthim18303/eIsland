type MaxExpandContentEagerModule = {
  default: typeof import('./MaxExpandContentEager').MaxExpandContentEager;
};
type MaxExpandContentEagerComponent = MaxExpandContentEagerModule['default'];

let maxExpandContentEagerPromise: Promise<MaxExpandContentEagerModule> | null = null;
let maxExpandContentEagerComponent: MaxExpandContentEagerComponent | null = null;

export function loadMaxExpandContentEager(): Promise<MaxExpandContentEagerModule> {
  if (!maxExpandContentEagerPromise) {
    maxExpandContentEagerPromise = import('./MaxExpandContentEager').then((module) => {
      maxExpandContentEagerComponent = module.MaxExpandContentEager;
      return { default: module.MaxExpandContentEager };
    });
  }
  return maxExpandContentEagerPromise;
}

export function getLoadedMaxExpandContentEager(): MaxExpandContentEagerComponent | null {
  return maxExpandContentEagerComponent;
}

export function preloadMaxExpandContentEager(): void {
  void loadMaxExpandContentEager();
}
