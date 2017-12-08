module Brainloller
    exposing
        ( Environment
        , Optcode
        , Pixel
        , Program
        , Runtime
        , cmdToPixel
        , cmds
        , commands
        , create
        , dimensions
        , getCellAt
        , getCellMaybe
        , getCmd
        , memoryTape
        , programCells
        , resize
        , setCellAt
        )

import Html exposing (Html, div, text)
import Html.Attributes exposing (class, classList, style, tabindex, title)
import Html.Events exposing (onClick, onMouseDown, onMouseOver, onMouseUp)
import List.Extra exposing (getAt, setAt)


type alias Environment =
    { runtime : Runtime
    , program : Program
    }


type alias Optcode =
    String


type alias Program =
    List (List Pixel)


type alias Runtime =
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


cmds : BLCmd String
cmds =
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


cmdToPixel : BLCmd Pixel
cmdToPixel =
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


getCmd : Optcode -> BLCmd a -> a
getCmd key dict =
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


create : Maybe String -> Runtime
create input =
    { activeCoor = ( 0, 0 )
    , activeCell = 0
    , jumps = []
    , pointerDeg = 0
    , output = Nothing
    , input = input
    , memory = []
    }


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list


getCellAt : Program -> Int -> Int -> Pixel
getCellAt program x y =
    getCellMaybe program x y
        |> Maybe.withDefault
            { r = 255, g = 255, b = 255 }


getCellMaybe : Program -> Int -> Int -> Maybe Pixel
getCellMaybe program x y =
    getAt x (asList (getAt y program))


setCellAt : Program -> Int -> Int -> Pixel -> Program
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


dimensions : Program -> ( Int, Int )
dimensions program =
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


resize : Program -> Int -> Int -> Program
resize program x y =
    let
        dims =
            dimensions program

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


pixelStyle : Pixel -> ( String, String )
pixelStyle p =
    ( "backgroundColor", "rgb(" ++ toString p.r ++ ", " ++ toString p.g ++ ", " ++ toString p.b ++ ")" )


programCells : Int -> Int -> Program -> Runtime -> (Int -> Int -> Bool -> msg) -> msg -> msg -> Html msg
programCells width height program runtime writeHandler enableHandler disableHandler =
    div
        [ onMouseDown enableHandler
        , onMouseUp disableHandler
        ]
    <|
        List.indexedMap
            (\rowIndex row ->
                row <|
                    List.indexedMap
                        (\cellIndex cell ->
                            let
                                pixel =
                                    getCellAt program cellIndex rowIndex

                                isActive =
                                    runtime.activeCoor == ( cellIndex, rowIndex )
                            in
                                cell
                                    [ onClick (writeHandler cellIndex rowIndex True)
                                    , onMouseDown (writeHandler cellIndex rowIndex True)
                                    , onMouseOver (writeHandler cellIndex rowIndex False)
                                    , style [ pixelStyle pixel ]
                                    , classList
                                        [ ( "program-cell", True )
                                        , ( "program-cell--active", isActive )
                                        ]
                                    ]
                                    []
                        )
                        (List.repeat width div)
            )
        <|
            List.repeat height <|
                div [ class "program-row" ]


commands : (Optcode -> msg) -> Optcode -> List (Html msg)
commands cmdSetter activeCmd =
    let
        picker =
            \label cmd ->
                div
                    [ onClick (cmdSetter cmd)
                    , tabindex 1
                    , title label
                    , classList
                        [ ( "cmd-btn", True )
                        , ( "cmd-btn-active", cmd == activeCmd )
                        , ( "cmd-btn--" ++ cmd, True )
                        ]
                    ]
                    []
    in
        [ picker ">" cmds.shiftRight
        , picker "<" cmds.shiftLeft
        , picker "+" cmds.increment
        , picker "-" cmds.decrement
        , picker "." cmds.ioWrite
        , picker "," cmds.ioRead
        , picker "[" cmds.loopOpen
        , picker "]" cmds.loopClose
        , picker "+90" cmds.rotateClockwise
        , picker "-90" cmds.rotateCounterClockwise
        ]


memoryTape : Runtime -> List (Html msg)
memoryTape runtime =
    let
        cell =
            \i val ->
                div
                    [ classList
                        [ ( "program-memory-cell", True )
                        , ( "program-memory-cell--active", runtime.activeCell == i )
                        ]
                    ]
                    [ div
                        [ class "program-memory-cell-content" ]
                        [ text (toString val) ]
                    ]

        len =
            List.length runtime.memory

        padding =
            List.drop len <| List.repeat 10 0

        cells =
            runtime.memory ++ padding
    in
        List.indexedMap cell cells
