import get from 'lodash/get'

const Ajv = require('ajv')
const ajv = new Ajv()

// CONST DECLARATION BLOCK (for checking by external observer)
export const NOTIFICATION_MESSAGE_TYPE = 'notification'
export const REQUIREMENT_MESSAGE_TYPE = 'requirement'
export const LOADED_STATUS_MESSAGE_TYPE = 'loading'
export const RESIZE_MESSAGE_TYPE = 'resize'
export const ERROR_MESSAGE_TYPE = 'error'

export type NotificationType = 'info' | 'warning' | 'error' | 'success'
export type RequirementType = 'auth' | 'organization'
export type LoadingStatuses = 'done'

// TYPES DECLARATION BLOCK
type NotificationMessageType = {
    type: 'notification',
    notificationType: NotificationType,
    message: string,
}

type RequirementMessageType = {
    type: 'requirement'
    requirement: RequirementType,
}

type LoadedStatusMessageType = {
    type: 'loading',
    status: LoadingStatuses,
}

type ErrorMessageType = {
    type: 'error',
    message: string,
    requestMessage?: Record<string, unknown>,
}

type ResizeMessageType = {
    type: 'resize',
    height: number,
}

type SystemMessageType = RequirementMessageType | NotificationMessageType | LoadedStatusMessageType | ErrorMessageType | ResizeMessageType

type SystemMessageReturnType = {
    type: 'system'
    message: SystemMessageType
}

type CustomMessageReturnType = {
    type: 'custom'
    message: Record<string, unknown>
}

type ParsedMessageReturnType = SystemMessageReturnType | CustomMessageReturnType

type parseMessageType = (data: any) => ParsedMessageReturnType

// CONFIGURATION BLOCK
const AvailableMessageTypes = [
    NOTIFICATION_MESSAGE_TYPE,
    REQUIREMENT_MESSAGE_TYPE,
    LOADED_STATUS_MESSAGE_TYPE,
    ERROR_MESSAGE_TYPE,
    RESIZE_MESSAGE_TYPE,
]

const MessagesRequiredProperties = {
    [NOTIFICATION_MESSAGE_TYPE]: ['notificationType', 'message'],
    [REQUIREMENT_MESSAGE_TYPE]: ['requirement'],
    [LOADED_STATUS_MESSAGE_TYPE]: ['status'],
    [ERROR_MESSAGE_TYPE]: ['message'],
    [RESIZE_MESSAGE_TYPE]: ['height'],
}

const SystemMessageDetectorSchema = {
    type: 'object',
    properties: {
        type: { enum: AvailableMessageTypes },
    },
    additionalProperties: true,
    required: ['type'],
}

const SystemMessageSchema = {
    type: 'object',
    properties: {
        type: { enum: AvailableMessageTypes },
        notificationType: { enum: ['info', 'warning', 'error', 'success'] },
        message: { type: 'string' },
        requirement: { enum: ['auth', 'organization'] },
        status: { const: 'done' },
        requestMessage: {  type: 'object' },
        height: { type: 'number' },
    },
    additionalProperties: false,
    required: ['type'],
    allOf: Object.keys(MessagesRequiredProperties).map(messageType => ({
        anyOf: [
            { not: { properties: { type: { const: messageType } } } },
            { required: MessagesRequiredProperties[messageType] },
        ],
    })),
}

const systemMessageDetector = ajv.compile(SystemMessageDetectorSchema)
const systemMessageValidator = ajv.compile(SystemMessageSchema)

// PARSING PART
export const parseMessage: parseMessageType = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null
    if (systemMessageDetector(data)) {
        if (!systemMessageValidator(data)) return null
        switch (data.type) {
            case NOTIFICATION_MESSAGE_TYPE:
                return {
                    type: 'system',
                    message: {
                        type: NOTIFICATION_MESSAGE_TYPE,
                        notificationType: data.notificationType,
                        message: data.message,
                    },
                }
            case REQUIREMENT_MESSAGE_TYPE:
                return {
                    type: 'system',
                    message: {
                        type: REQUIREMENT_MESSAGE_TYPE,
                        requirement: data.requirement,
                    },
                }
            case LOADED_STATUS_MESSAGE_TYPE:
                return {
                    type: 'system',
                    message: {
                        type: LOADED_STATUS_MESSAGE_TYPE,
                        status: data.status,
                    },
                }
            case ERROR_MESSAGE_TYPE:
                return {
                    type: 'system',
                    message: {
                        type: ERROR_MESSAGE_TYPE,
                        message: data.message,
                        requestMessage: get(data, 'requestMessage'),
                    },
                }
            case RESIZE_MESSAGE_TYPE:
                return {
                    type: 'system',
                    message: {
                        type: RESIZE_MESSAGE_TYPE,
                        height: data.height,
                    },
                }
        }
    } else {
        return { type: 'custom', message: data }
    }
}

// UTILS BLOCK
export const sendMessage = (message: Record<string, unknown>, receiver: Window, receiverOrigin: string): void => {
    if (receiver) {
        receiver.postMessage(message, receiverOrigin)
    }
}

export const sendNotification = (message: string, messageType: NotificationType, receiver: Window, receiverOrigin: string): void => {
    sendMessage({
        type: NOTIFICATION_MESSAGE_TYPE,
        notificationType: messageType,
        message,
    }, receiver, receiverOrigin)
}

export const sendRequirementRequest = (requirement: RequirementType, receiver: Window, receiverOrigin: string): void => {
    sendMessage({
        type:REQUIREMENT_MESSAGE_TYPE,
        requirement,
    }, receiver, receiverOrigin)
}

export const sendLoadedStatus = (receiver: Window, receiverOrigin: string): void => {
    sendMessage({
        type: LOADED_STATUS_MESSAGE_TYPE,
        status: 'done',
    }, receiver, receiverOrigin)
}

export const sendError = (message: string, requestMessage: Record<string, unknown>, receiver: Window, receiverOrigin: string): void => {
    sendMessage({
        type: ERROR_MESSAGE_TYPE,
        message,
        requestMessage,
    }, receiver, receiverOrigin)
}

export const sendSize = (height: number, receiver: Window, receiverOrigin: string): void => {
    sendMessage({
        type: RESIZE_MESSAGE_TYPE,
        height,
    }, receiver, receiverOrigin)
}