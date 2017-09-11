module Brainloller.Lang exposing (BLOptCode, BLProgram, Pixel, blCmd, blCmdPixel, getBlCmd)


type alias BLOptCode =
    String


type alias BLProgram =
    List (List Pixel)


type alias BLCmd a =
    { shiftRight : a
    , shiftLeft : a
    , increment : a
    , decrement : a
    , ioWrite : a
    , ioRead : a
    , loopOpen : a
    , loopClose : a
    , rotateClockwise : a
    , rotateCounterClockwise : a
    , noop : a
    }


type alias Pixel =
    { r : Int
    , g : Int
    , b : Int
    }


pixel : Int -> Int -> Int -> Pixel
pixel r g b =
    { r = r
    , g = g
    , b = b
    }


blCmd : BLCmd String
blCmd =
    { shiftRight = "shiftRight"
    , shiftLeft = "shiftLeft"
    , increment = "increment"
    , decrement = "decrement"
    , ioWrite = "ioWrite"
    , ioRead = "ioRead"
    , loopOpen = "loopOpen"
    , loopClose = "loopClose"
    , rotateClockwise = "rotateClockwise"
    , rotateCounterClockwise = "rotateCounterClockwise"
    , noop = "noop"
    }


blCmdPixel : BLCmd Pixel
blCmdPixel =
    { shiftRight = pixel 255 0 0 -- >, red
    , shiftLeft = pixel 128 0 0 -- <, dark red
    , increment = pixel 0 255 0 -- +, green
    , decrement = pixel 0 128 0 -- -, dark green
    , ioWrite = pixel 0 0 255 -- ., blue
    , ioRead = pixel 0 0 128 -- ,, dark blue
    , loopOpen = pixel 255 255 0 -- [, yellow
    , loopClose = pixel 128 128 0 -- ], dark yellow
    , rotateClockwise = pixel 0 255 255 -- +90, cyan
    , rotateCounterClockwise = pixel 0 128 128 -- -90, dark cyan
    , noop = pixel 0 0 0 -- noop, white
    }


getBlCmd : BLOptCode -> BLCmd a -> a
getBlCmd key dict =
    case key of
        "shiftRight" ->
            dict.shiftRight

        "shiftLeft" ->
            dict.shiftLeft

        "increment" ->
            dict.increment

        "decrement" ->
            dict.decrement

        "ioWrite" ->
            dict.ioWrite

        "ioRead" ->
            dict.ioRead

        "loopOpen" ->
            dict.loopOpen

        "loopClose" ->
            dict.loopClose

        "rotateClockwise" ->
            dict.rotateClockwise

        "rotateCounterClockwise" ->
            dict.rotateCounterClockwise

        _ ->
            dict.noop
