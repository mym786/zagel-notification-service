const kafka = require('./../modules/integration/kafka')
const producer = kafka.producer()

module.exports.send = async function(userId, message, topic) {
    try {
      try {
        await producer.connect();
      } catch(e) {
        console.log(e);
      }
    const responses = await producer.send({
        topic: topic,
        messages: [{
          // Name of the published package as key, to make sure that we process events in order
          key: userId,
  
          // The message value is just bytes to Kafka, so we need to serialize our JavaScript
          // object to a JSON string. Other serialization methods like Avro are available.
          value: JSON.stringify(message)
        }]
      })
  
      console.log('Published message', { responses })
    } catch (error) {
      console.error('Error publishing message', error)
    }
}