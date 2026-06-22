import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => {
  console.log('Socket connected')
})

socket.on('disconnect', () => {
  console.log('Socket disconnected')
})

export function joinDropRoom(dropId: string): void {
  socket.emit('join-drop', { dropId })
}

export function leaveDropRoom(dropId: string): void {
  socket.emit('leave-drop', { dropId })
}
