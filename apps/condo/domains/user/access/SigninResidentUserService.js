/**
 * Generated by `createservice user.SigninResidentUserService`
 */
async function canSigninResidentUser ({ authentication: { item: user } }) {
    // Only anonymous can use this mutation
    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canSigninResidentUser,
}
