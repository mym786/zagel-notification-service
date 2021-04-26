const constants = require('./../constants');

const kafka = require('./../modules/integration/kafka');
const notificationManager = require('./../managers/notification-manager');

const consumer = kafka.consumer({
  groupId: process.env.GROUP_ID || 'GROUP1'
})

const main = async () => {
  await consumer.connect()

  await consumer.subscribe({
    topic: constants.TOPIC_DEVICE,
    fromBeginning: true
  })

  await consumer.subscribe({
    topic: constants.TOPIC_EMAIL,
    fromBeginning: true
  })

  await consumer.subscribe({
    topic: constants.TOPIC_SMS,
    fromBeginning: true
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Received message', {
        topic,
        partition,
        key: message.key.toString(),
        value: message.value.toString()
      })

      notificationManager.listen(topic, {
          userId: message.key.toString(),
          message: message.value.toString()
      });

    }
  })
}

main().catch(async error => {
  console.error(error)
  try {
    await consumer.disconnect()
  } catch (e) {
    console.error('Failed to gracefully disconnect consumer', e)
  }
  process.exit(1)
})
