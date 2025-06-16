import { Metadata } from 'next'

import MessageContainer from '@/client/components/pages/MessageContainer'

export const metadata: Metadata = {
  title: 'Boîte d\'envois',
  alternates: {
    canonical: `${process.env.CLIENT_URL}/messages/sent`,
  },
}

const SendboxPage: React.FC = () => {
  return <MessageContainer isSentbox={true} />
}

export default SendboxPage
