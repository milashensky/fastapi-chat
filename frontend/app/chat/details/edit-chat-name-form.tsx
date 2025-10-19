import { useRef, useState } from 'react'
import { type ChatRoom } from '~/chat/types'
import Button from '~/ui-kit/button'
import Form, { type FormRef } from '~/ui-kit/form'
import Icon from '~/ui-kit/icon'
import Input from '~/ui-kit/input'
import {
    getMinLengthValidator,
    requiredFieldValidator,
} from '~/utils/validators'
import { CHAT_NAME_MIN_LENGTH } from '~/utils/constants'
import { useChatEdit } from './use-chat-edit'


interface Props {
    onBack: () => void
    chat: ChatRoom
}

const chatNameLengthValidator = getMinLengthValidator(CHAT_NAME_MIN_LENGTH)

const EditChatNameForm = (props: Props) => {
    const {
        onBack,
        chat,
    } = props
    const [name, setName] = useState(chat.name)
    const formRef = useRef<FormRef>(null)
    const validate = (): boolean => {
        const isValid = formRef.current?.validate()
        return Boolean(isValid)
    }
    const {
        submit,
        errors,
        isPending,
    } = useChatEdit({
        roomId: chat.id,
        form: { name },
        actions: {
            onSuccess: onBack,
            validate,
        },
    })
    return (
        <Form
            ref={formRef}
            className="flex justify-between items-center gap-2"
            onSubmit={submit}
        >
            <div className="flex flex-col flex">
                <Input
                    placeholder="Enter new name for this chat"
                    name="name"
                    data-testid="name-input"
                    disabled={isPending}
                    rules={[requiredFieldValidator, chatNameLengthValidator]}
                    value={name}
                    errors={errors.name}
                    onInput={setName}
                />
            </div>
            <div className="flex gap-2">
                <Button
                    icon
                    disabled={isPending}
                    data-testid="submit"
                    type="submit"
                >
                    <Icon
                        icon="accept"
                    />
                </Button>
                <Button
                    icon
                    type="reset"
                    color="secondary"
                    data-testid="reset"
                    disabled={isPending}
                    onClick={onBack}
                >
                    <Icon
                        icon="close"
                    />
                </Button>
            </div>
        </Form>
    )
}

export default EditChatNameForm
