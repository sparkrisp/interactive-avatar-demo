import { RefObject } from "react"
import type { StreamingAvatarApi } from "@heygen/streaming-avatar"
import { atom } from "jotai"

//Stream Atoms
export const mediaStreamActiveAtom = atom<boolean>(false)
export const streamAtom = atom<MediaStream | undefined>(undefined)
export const debugAtom = atom<string>("")
export const inputTextAtom = atom<string>("")
export const avatarIdAtom = atom<string>("")
export const voiceIdAtom = atom<string>("")
export const sessionDataAtom = atom<any | undefined>(undefined)
export const qualityAtom = atom<string>("medium")
export const avatarAtom = atom<RefObject<StreamingAvatarApi> | undefined>(undefined)

// Video Processing Atoms
export const mediaCanvasRefAtom = atom<RefObject<HTMLCanvasElement> | undefined>(undefined)
export const mediaStreamRefAtom = atom<RefObject<HTMLVideoElement> | undefined>(undefined)
export const removeBGAtom = atom<boolean>(false)

//UI Atoms
export const customBgPicAtom = atom<string>("")