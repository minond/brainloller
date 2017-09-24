module Lang
    exposing
        ( BLEnvironment
        , BLOptCode
        , BLProgram
        , BLRuntime
        , Pixel
        , blCmd
        , blCmdPixel
        , createRuntime
        , getBlCmd
        , getCellAt
        , getCellMaybe
        , programDimensions
        , resizeProgram
        , setCellAt
        )

import List.Extra exposing (getAt, setAt)
import Util exposing (asList)


type alias BLEnvironment =
    { runtime : BLRuntime
    , program : BLProgram
    }


type alias BLOptCode =
    String


type alias BLProgram =
    List (List Pixel)


type alias BLRuntime =
    { activeCoor : ( Int, Int )
    , activeCell : Int
    , jumps : List ( Int, Int, Int )
    , pointerDeg : Int
    , output : Maybe String
    , input : Maybe String
    , memory : List Int
    }


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


createRuntime : Maybe String -> BLRuntime
createRuntime input =
    { activeCoor = ( 0, 0 )
    , activeCell = 0
    , jumps = []
    , pointerDeg = 0
    , output = Nothing
    , input = input
    , memory = []
    }


getCellAt : BLProgram -> Int -> Int -> Pixel
getCellAt program x y =
    getCellMaybe program x y
        |> Maybe.withDefault
            { r = 255, g = 255, b = 255 }


getCellMaybe : BLProgram -> Int -> Int -> Maybe Pixel
getCellMaybe program x y =
    getAt x (asList (getAt y program))


setCellAt : BLProgram -> Int -> Int -> Pixel -> BLProgram
setCellAt program x y p =
    let
        row =
            asList (getAt y program)

        updatedRow =
            asList (setAt x p row)

        updatedProgram =
            asList (setAt y updatedRow program)
    in
    updatedProgram


programDimensions : BLProgram -> ( Int, Int )
programDimensions program =
    let
        height =
            List.length program

        width =
            Maybe.withDefault 0 <|
                Maybe.andThen
                    (\row -> Just <| List.length row)
                    (List.head program)
    in
    ( width, height )


resizeProgram : BLProgram -> Int -> Int -> BLProgram
resizeProgram program x y =
    let
        dims =
            programDimensions program

        width =
            max (x + 1) (Tuple.first dims)

        height =
            max (y + 1) (Tuple.second dims)
    in
    List.indexedMap
        (\y _ ->
            List.indexedMap
                (\x _ ->
                    getCellAt program x y
                )
                (List.repeat width Nothing)
        )
        (List.repeat height Nothing)
