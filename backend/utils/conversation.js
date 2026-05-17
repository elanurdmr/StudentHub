/** conversationId iki kullanıcı id'sinin sıralı birleşimidir: "idA-idB" */

export function getConvPartners(convId) {
  if (!convId || typeof convId !== 'string') return null;
  const parts = convId.split('-');
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b) return null;
  return [a, b];
}

export function getOtherParticipantId(convId, userId) {
  const ids = userId?.toString();
  const p = getConvPartners(convId);
  if (!p) return null;
  const [x, y] = p;
  if (x === ids) return y;
  if (y === ids) return x;
  return null;
}

export function userBelongsToConversation(convId, userId) {
  const uid = userId?.toString();
  return getOtherParticipantId(convId, uid) !== null;
}
