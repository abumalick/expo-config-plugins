import {v4 as uuidv4} from 'uuid'

export const generateXCodeId = () => {
  // https://stackoverflow.com/a/22665502/1673761
  return uuidv4().toUpperCase().split('-').slice(1).join('')
}
