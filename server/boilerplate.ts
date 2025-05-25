import { mocks } from 'mock-browser'

// for pixi-filters
global.window = {
  innerWidth: 1920,
  innerHeight: 1080
}

// for react-hot-toast
const mock = new mocks.MockBrowser()
global.document = mock.getDocument()
