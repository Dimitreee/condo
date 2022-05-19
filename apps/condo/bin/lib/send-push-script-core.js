const path = require('path')

const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')

const { ScriptCore, runMain } = require('./script-core')

const BASE_NAME = path.posix.basename(process.argv[1])

class SendPushScriptCore extends ScriptCore {
    constructor ({ messageType }) {
        super()

        this.messageType = messageType
    }

    async sendMessage (userId, lang, data) {
        return await sendMessage(this.context, {
            lang,
            to: { user: { id: userId } },
            type: this.messageType,
            meta: { dv: 1, data },
            sender: { dv: 1, fingerprint: `condo/bin/${BASE_NAME}` },
        })
    }

}

module.exports = {
    SendPushScriptCore,
    runMain,
}