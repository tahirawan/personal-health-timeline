import { cn } from './classNames';

const focusRing =
  'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(19_139_131_/_30%)]';

const buttonBase = cn(
  'inline-flex cursor-pointer items-center justify-center gap-2 border-0 font-extrabold',
  'transition-[transform,background-color,color,box-shadow] duration-150 ease-in-out',
  'hover:-translate-y-px focus-visible:-translate-y-px disabled:cursor-not-allowed disabled:opacity-[0.58]',
  focusRing,
);

const lightGlassBackground =
  'bg-[linear-gradient(145deg,rgb(255_255_255_/_94%),rgb(234_248_245_/_80%))]';

const tintedGlassBackground =
  'bg-[linear-gradient(145deg,rgb(19_139_131_/_8%),rgb(255_255_255_/_60%))]';

export const ui = {
  page: cn(
    'relative min-h-screen min-w-80 overflow-x-hidden',
    'bg-[linear-gradient(155deg,rgb(255_255_255_/_10%),transparent_34%),linear-gradient(180deg,var(--color-health-bg-top),var(--color-health-bg-bottom))]',
    'font-sans text-health-ink antialiased [font-synthesis:none] [text-rendering:optimizeLegibility]',
  ),
  backdrop: cn(
    'pointer-events-none fixed inset-0 z-0 opacity-[0.44]',
    'bg-[linear-gradient(rgb(255_255_255_/_12%)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_12%)_1px,transparent_1px)]',
    '[background-size:54px_54px] [mask-image:linear-gradient(180deg,rgb(0_0_0_/_70%),transparent_82%)]',
  ),
  appShell: cn(
    'relative z-10 mx-auto overflow-x-clip pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+28px)]',
    'w-[min(calc(100%_-_36px),1080px)] max-[680px]:w-[calc(100%_-_28px)] max-[420px]:w-[calc(100%_-_24px)]',
  ),
  panel:
    'rounded-[28px] border border-white/40 shadow-health-panel backdrop-blur-[18px] max-[680px]:rounded-[22px]',
  section: cn(
    'mb-[18px] rounded-[28px] border border-white/40 p-6 shadow-health-panel backdrop-blur-[18px] max-[680px]:rounded-[22px] max-[680px]:p-5',
    lightGlassBackground,
  ),
  hero: cn(
    'grid min-h-0 justify-items-center gap-[18px] p-6 text-center max-[680px]:p-5',
    'rounded-[28px] border border-white/40 shadow-health-panel backdrop-blur-[18px] max-[680px]:rounded-[22px]',
    'bg-[linear-gradient(145deg,rgb(255_255_255_/_96%),rgb(235_248_244_/_84%))]',
  ),
  heroCopy: 'min-w-0',
  eyebrow: 'mt-0 mb-2.5 text-[0.78rem] font-bold tracking-[0.18em] text-health-accent uppercase',
  h1: 'm-0 font-display text-[clamp(2.2rem,6vw,4rem)] leading-[0.92] tracking-[0.02em] font-bold',
  h2: 'mt-0 mb-[18px] text-[1.15rem] font-bold',
  h3: 'mt-0 mb-3.5 text-base font-bold',
  heroText:
    'mx-auto mt-3.5 mb-0 max-w-[42rem] text-[1.03rem] leading-[1.6] text-health-muted break-words',
  heroSide:
    'flex w-full items-center justify-center max-[860px]:items-stretch max-[860px]:justify-stretch',
  views: 'mt-6',
  nav: cn(
    'm-0 inline-grid w-full max-w-[680px] grid-cols-4 gap-2 rounded-full border p-2 backdrop-blur-[18px]',
    'border-[rgb(19_139_131_/_16%)] bg-[rgb(19_139_131_/_10%)] shadow-[inset_0_1px_0_rgb(255_255_255_/_46%)]',
    'max-[680px]:grid-cols-2 max-[680px]:rounded-[22px] max-[420px]:gap-1.5 max-[420px]:p-1.5',
  ),
  navButton: cn(
    buttonBase,
    'min-h-11 min-w-0 rounded-full bg-transparent px-2.5 text-health-muted max-[680px]:px-2 max-[420px]:text-[0.86rem]',
  ),
  navButtonActive:
    'bg-[linear-gradient(135deg,rgb(9_41_50_/_98%),rgb(18_63_70_/_94%))] text-white shadow-[0_10px_20px_rgb(6_21_28_/_16%)]',
  navButtonIcon: 'max-[680px]:hidden',
  navButtonLabel: 'overflow-hidden text-ellipsis whitespace-nowrap',
  primaryButton: cn(
    buttonBase,
    'min-h-[52px] rounded-full px-[18px] text-white shadow-[0_14px_26px_rgb(6_21_28_/_16%)] max-[680px]:min-h-11 max-[680px]:px-4 max-[680px]:text-[0.94rem]',
    'bg-[linear-gradient(135deg,var(--color-health-primary-strong),var(--color-health-teal))]',
  ),
  secondaryButton: cn(
    buttonBase,
    'min-h-[52px] rounded-full border border-[rgb(19_139_131_/_16%)] bg-[rgb(19_139_131_/_12%)] px-[18px] text-health-ink max-[680px]:min-h-11 max-[680px]:px-4 max-[680px]:text-[0.94rem]',
  ),
  dangerButton: cn(
    buttonBase,
    'min-h-[52px] rounded-full px-[18px] text-white shadow-[0_14px_26px_rgb(89_20_24_/_18%)] max-[680px]:min-h-11 max-[680px]:px-4 max-[680px]:text-[0.94rem]',
    'bg-[linear-gradient(135deg,#8f1d24,#c2412d)]',
  ),
  iconButton: cn(
    buttonBase,
    'min-h-[42px] w-[42px] rounded-full border border-[rgb(19_139_131_/_12%)] bg-white/60 text-health-ink',
  ),
  dangerIconButton: 'bg-[rgb(255_226_207_/_78%)] text-health-danger',
  quickActions: 'grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-1',
  actionGrid: 'grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-1',
  quickPrimaryButton: cn(
    buttonBase,
    'min-h-[72px] justify-start rounded-[20px] border border-[rgb(19_139_131_/_16%)] px-[18px] py-4 text-white shadow-none max-[680px]:min-h-[54px] max-[680px]:rounded-2xl max-[680px]:px-3.5 max-[680px]:py-3 max-[680px]:text-[0.96rem]',
    'bg-[linear-gradient(135deg,rgb(9_41_50_/_98%),rgb(19_139_131_/_92%))]',
  ),
  quickSecondaryButton: cn(
    buttonBase,
    'min-h-[72px] justify-start rounded-[20px] border border-[rgb(19_139_131_/_16%)] px-[18px] py-4 text-health-ink shadow-none max-[680px]:min-h-[54px] max-[680px]:rounded-2xl max-[680px]:px-3.5 max-[680px]:py-3 max-[680px]:text-[0.96rem]',
    'bg-[linear-gradient(145deg,rgb(19_139_131_/_10%),rgb(255_255_255_/_62%))]',
  ),
  quickIcon: 'max-[680px]:h-[18px] max-[680px]:w-[18px]',
  sectionHeadingRow:
    'mb-[18px] flex items-end justify-between gap-4 max-[680px]:flex-col max-[680px]:items-stretch',
  sectionDescription: 'mb-0 text-sm leading-6 text-health-muted',
  fieldHelp: 'mb-0 text-sm leading-6 text-health-muted',
  compactField: 'grid min-w-[170px] gap-2.5 font-extrabold text-health-ink',
  label: 'mt-4 grid gap-2.5 font-extrabold text-health-ink',
  input: cn(
    'min-h-[58px] w-full rounded-[14px] border border-[rgb(33_26_51_/_12%)] bg-white/90 px-4 text-health-ink',
    'shadow-[inset_0_1px_0_rgb(255_255_255_/_72%)]',
    focusRing,
  ),
  textarea: cn(
    'min-h-28 w-full resize-y rounded-[14px] border border-[rgb(33_26_51_/_12%)] bg-white/90 px-4 py-3.5 text-health-ink',
    'shadow-[inset_0_1px_0_rgb(255_255_255_/_72%)]',
    focusRing,
  ),
  fileInput: cn(
    'min-h-[58px] w-full rounded-[14px] border border-[rgb(33_26_51_/_12%)] bg-white/90 px-4 py-3 text-health-ink',
    'shadow-[inset_0_1px_0_rgb(255_255_255_/_72%)] file:mr-4 file:rounded-full file:border-0 file:bg-[rgb(19_139_131_/_12%)] file:px-3 file:py-2 file:font-extrabold file:text-health-ink',
    focusRing,
  ),
  stackedForm: 'grid gap-[18px]',
  formGrid: 'grid gap-3.5',
  formGridTwoColumn: 'grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-1',
  formActions: 'flex flex-wrap justify-end gap-2.5 mt-4',
  checkboxRow: cn(
    'mt-4 grid grid-cols-[auto_1fr] items-start gap-3.5 rounded-[20px] border border-[rgb(19_139_131_/_16%)] px-[18px] py-4 font-extrabold',
    tintedGlassBackground,
  ),
  checkboxInput: 'mt-0.5 min-h-[22px] w-[22px] accent-health-teal',
  fieldError: 'm-0 font-extrabold text-health-danger',
  previewNote: 'mt-4 rounded-[20px] bg-[rgb(255_242_232_/_88%)] px-[18px] py-4 text-health-muted',
  emptyState: 'mb-0 text-health-muted',
  disclaimer:
    'mt-1.5 mb-0 rounded-[20px] border border-white/20 bg-[rgb(6_21_28_/_30%)] px-[18px] py-4 font-extrabold text-white/80 backdrop-blur-[14px]',
  privacyList: 'grid gap-3 text-health-muted',
  statsGrid: 'grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(138px,1fr))]',
  statsGridCompact:
    'grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(138px,1fr))] max-[680px]:grid-cols-2',
  metricCard: cn(
    'grid min-h-[102px] gap-2 rounded-[20px] border border-[rgb(19_139_131_/_16%)] px-[18px] py-4 max-[680px]:min-h-[86px] max-[680px]:rounded-2xl max-[680px]:px-3.5 max-[680px]:py-3',
    tintedGlassBackground,
  ),
  metricLabel: 'text-sm font-extrabold text-health-muted max-[680px]:text-[0.82rem]',
  metricValue:
    'break-words text-[clamp(1.35rem,4vw,2rem)] leading-none text-health-ink max-[680px]:text-[1.65rem]',
  chartPanel: cn(
    'mt-[18px] min-h-[278px] w-full rounded-[20px] pt-4 pb-1 text-white',
    'bg-[linear-gradient(135deg,rgb(9_41_50_/_96%),rgb(62_82_132_/_92%))]',
  ),
  miniChartPanel: 'min-h-52',
  chartEmptyState: 'mb-0 px-[18px] text-white/80',
  linkPanel: cn(
    'mt-[18px] flex items-center justify-between gap-4 rounded-[20px] border border-[rgb(19_139_131_/_16%)] px-[18px] py-4 max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:rounded-2xl max-[680px]:px-3.5 max-[680px]:py-3',
    tintedGlassBackground,
  ),
  linkPanelTitle: 'mt-0 mb-1 text-base font-bold',
  linkPanelText: 'mb-0 text-sm leading-6 text-health-muted',
  timelineGroups: 'grid gap-[18px]',
  timelineGroupTitle: 'text-health-muted',
  timelineList: 'm-0 grid list-none gap-3 p-0',
  timelineItem: cn(
    'grid items-start gap-3 rounded-[20px] border border-[rgb(33_26_51_/_12%)] bg-white/70 px-[18px] py-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_56%)]',
    '[grid-template-columns:4.4rem_2.6rem_minmax(0,1fr)_auto] max-[680px]:[grid-template-columns:3.8rem_2.35rem_minmax(0,1fr)] max-[420px]:[grid-template-columns:3.25rem_2.25rem_minmax(0,1fr)] max-[420px]:gap-2.5 max-[420px]:px-3.5 max-[420px]:py-3',
  ),
  timelineTime: 'font-black text-health-ink max-[420px]:text-[0.96rem]',
  timelineIcon:
    'grid h-[2.35rem] w-[2.35rem] place-items-center rounded-[10px] text-white max-[420px]:h-9 max-[420px]:w-9',
  timelineContent: 'grid min-w-0 gap-1 break-words',
  timelineMutedText: 'text-health-muted max-[420px]:text-[0.94rem]',
  timelineContentText: 'max-[420px]:text-[0.94rem]',
  timelineContentStrong: 'break-words max-[420px]:text-[0.98rem]',
  timelineActions: cn(
    'flex flex-wrap justify-end gap-1.5 max-[680px]:col-span-full max-[680px]:justify-end max-[420px]:col-start-2 max-[420px]:col-end-4',
  ),
  modalBackdrop: 'fixed inset-0 z-20 grid items-end bg-[rgb(6_21_28_/_62%)] p-[18px]',
  modalPanel: cn(
    'mx-auto max-h-[min(88vh,780px)] w-full max-w-[640px] overflow-auto rounded-[28px] border border-white/40 p-6 shadow-health-panel backdrop-blur-[18px] max-[680px]:rounded-[22px]',
    'bg-[linear-gradient(145deg,rgb(255_255_255_/_96%),rgb(235_248_244_/_88%))]',
  ),
  modalHeader: 'mb-[18px] flex items-center justify-between gap-4',
  modalTitle: 'mb-0 text-[1.15rem] font-bold',
  confirmPanel: cn(
    'mx-auto grid w-full max-w-[460px] gap-[18px] rounded-[28px] border border-white/40 p-6 shadow-health-panel backdrop-blur-[18px]',
    'bg-[linear-gradient(145deg,rgb(255_255_255_/_96%),rgb(235_248_244_/_88%))]',
  ),
  confirmTitle: 'mb-2 text-[1.25rem] font-bold',
  confirmText: 'mb-0 leading-6 text-health-muted',
  toastViewport: 'fixed z-30 grid w-[min(420px,calc(100vw-24px))] gap-3',
  toastCard: cn(
    'flex items-start justify-between gap-3 rounded-[18px] border border-white/40 px-4 py-3 shadow-health-panel backdrop-blur-[18px]',
    'bg-[linear-gradient(145deg,rgb(255_255_255_/_96%),rgb(235_248_244_/_90%))]',
  ),
  toastTitle: 'block text-sm font-black text-health-ink',
  toastText: 'mt-1 mb-0 text-sm leading-5 text-health-muted',
  toastDismiss:
    'grid min-h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-xl leading-none text-health-muted',
};

export const toastPositionClasses = {
  'top-right':
    'top-4 right-4 max-[420px]:right-3 max-[420px]:left-3 max-[420px]:w-auto max-[420px]:translate-x-0',
  'top-center':
    'top-4 left-1/2 -translate-x-1/2 max-[420px]:right-3 max-[420px]:left-3 max-[420px]:w-auto max-[420px]:translate-x-0',
  'bottom-right':
    'right-4 bottom-4 max-[420px]:right-3 max-[420px]:left-3 max-[420px]:w-auto max-[420px]:translate-x-0',
  'bottom-center':
    'bottom-4 left-1/2 -translate-x-1/2 max-[420px]:right-3 max-[420px]:left-3 max-[420px]:w-auto max-[420px]:translate-x-0',
} as const;

export const toastToneClasses = {
  success: 'border-[rgb(23_102_58_/_28%)]',
  error: 'border-[rgb(180_35_43_/_28%)]',
  info: 'border-[rgb(19_139_131_/_28%)]',
} as const;

export const timelineIconClasses = {
  bloodPressure: 'bg-health-teal',
  meal: 'bg-health-accent',
  tablet: 'bg-[#2e6ecb]',
  note: 'bg-health-violet',
} as const;
