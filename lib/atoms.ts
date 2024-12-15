import { RefObject } from "react"
import type { StreamingAvatarApiConfig } from "@heygen/streaming-avatar"
import { atom } from "jotai"

//Stream Atoms
export const mediaStreamActiveAtom = atom<boolean>(false)
export const streamAtom = atom<MediaStream | undefined>(undefined)
export const debugAtom = atom<string>("")
export const inputTextAtom = atom<string>("")
export const avatarIdAtom = atom<string>("")
export const voiceIdAtom = atom<string>("")
export const sessionDataAtom = atom<any>(undefined)  // cambiado a any para evitar problemas de tipos
export const qualityAtom = atom<"low" | "medium" | "high">("medium")
export const avatarAtom = atom<RefObject<StreamingAvatarApiConfig> | undefined>(undefined)

// Video Processing Atoms
export const mediaCanvasRefAtom = atom<RefObject<HTMLCanvasElement> | undefined>(undefined)
export const mediaStreamRefAtom = atom<RefObject<HTMLVideoElement> | undefined>(undefined)
export const removeBGAtom = atom<boolean>(false)

//UI Atoms
export const customBgPicAtom = atom<string>("")