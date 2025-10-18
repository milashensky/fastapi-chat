import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ChatRoom } from '~/chat/types'
import Dialog from '~/ui-kit/dialog'
import Button from '~/ui-kit/button'
import Card from '~/ui-kit/card'
import Form, { type FormRef } from '~/ui-kit/form'
import Input from '~/ui-kit/input'
import {
    requiredFieldValidator,
    getMinLengthValidator,
} from '~/utils/validators'
import { CHAT_BASE_ROUTE, CHAT_NAME_MIN_LENGTH } from '~/utils/constants'
import { useCreateChat } from './use-create-chat'


interface Props {
    isShown: boolean
    onHide: () => void
}

const chatNameLengthValidator = getMinLengthValidator(CHAT_NAME_MIN_LENGTH)

const CreateChatDialog = (props: Props) => {
    const formRef = useRef<FormRef>(null)
    const [chatName, setChatName] = useState('')
    const navigate = useNavigate()
    const validate = (): boolean => {
        const isValid = formRef.current?.validate()
        return Boolean(isValid)
    }
    const onSuccess = (chat: ChatRoom) => {
        props.onHide()
        navigate(`${CHAT_BASE_ROUTE}/${chat.id}`)
        setChatName('')
    }
    const {
        errors,
        isPending,
        submit,
    } = useCreateChat({
        name: chatName,
        actions: {
            validate,
            onSuccess,
        },
    })
    return (
        <Dialog
            isShown={props.isShown}
            onHide={props.onHide}
        >
            <Card
                className="m-1"
                maxWidth={360}
            >
                <h3>
                    Create new chat
                </h3>
                <Form
                    ref={formRef}
                    className="flex flex-col gap-3"
                    onSubmit={submit}
                >
                    <Input
                        value={chatName}
                        onInput={setChatName}
                        disabled={isPending}
                        errors={errors.name}
                        rules={[requiredFieldValidator, chatNameLengthValidator]}
                        type="text"
                        label="Name"
                        data-testid="name"
                        placeholder="Enter a name for new chat"
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            onClick={props.onHide}
                            color="secondary"
                            disabled={isPending}
                        >
                            close
                        </Button>
                        <Button
                            type="submit"
                            data-testid="submit"
                            disabled={isPending}
                        >
                            Create
                        </Button>
                    </div>
                </Form>
            </Card>
        </Dialog>
    )
}

export default CreateChatDialog
