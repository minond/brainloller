module Brainloller.Pixel
    exposing
        ( commandsForm
        , getCellMaybe
        , programCells
        , programDimensions
        , programForm
        , resizeProgram
        , setCellAt
        )

import Brainloller.Lang exposing (BLOptCode, BLProgram, Pixel, blCmd)
import Collage exposing (Form, filled, move, square)
import Color exposing (Color, rgb)
import Html exposing (Html, div)
import Html.Attributes exposing (class, classList, style, tabindex)
import Html.Events exposing (onClick, onMouseDown, onMouseOver, onMouseUp)
import List.Extra exposing (getAt, setAt)
import Maybe
import Util exposing (asList)


type alias BoardConfig =
    { cellSize : Int
    , width : Int
    , startX : Int
    , startY : Int
    }


pixelColor : Pixel -> Color
pixelColor { r, g, b } =
    rgb r g b


pixelStyle : Pixel -> ( String, String )
pixelStyle p =
    ( "backgroundColor", "rgb(" ++ toString p.r ++ ", " ++ toString p.g ++ ", " ++ toString p.b ++ ")" )


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


getCellAt : BLProgram -> Int -> Int -> Pixel
getCellAt program x y =
    getCellMaybe program x y
        |> Maybe.withDefault
            { r = 255, g = 255, b = 255 }


getCellMaybe : BLProgram -> Int -> Int -> Maybe Pixel
getCellMaybe program x y =
    getAt x (asList (getAt y program))


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


programCells : Int -> Int -> BLProgram -> (Int -> Int -> Bool -> msg) -> msg -> msg -> Html msg
programCells width height program writeHandler enableHandler disableHandler =
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
                            in
                            cell
                                [ class "program-cell"
                                , onClick (writeHandler cellIndex rowIndex True)
                                , onMouseDown (writeHandler cellIndex rowIndex True)
                                , onMouseOver (writeHandler cellIndex rowIndex False)
                                , style [ pixelStyle pixel ]
                                ]
                                []
                        )
                        (List.repeat width div)
            )
        <|
            List.repeat height <|
                div [ class "program-row" ]


pixelForm : BoardConfig -> Int -> Pixel -> Form
pixelForm board index pixel =
    let
        x =
            rem index board.width * board.cellSize - board.startX

        y =
            (index // board.width) * board.cellSize + board.startY

        point =
            ( toFloat x, toFloat y )

        color =
            rgb pixel.r pixel.g pixel.b
    in
    move point <| filled color <| square 20


programForm : BLProgram -> List Form
programForm program =
    let
        cellSize =
            20

        height =
            List.length program

        width =
            Maybe.withDefault 0 <|
                Maybe.andThen
                    (\row -> Just <| List.length row)
                    (List.head program)

        startX =
            width // 2 * cellSize

        startY =
            height // 2 * cellSize * -1

        continuous =
            List.foldl (++) [] program

        board =
            { cellSize = cellSize
            , width = width
            , startX = width // 2 * cellSize
            , startY = startY
            }

        processPixel =
            \index pixel ->
                pixelForm board index pixel
    in
    List.indexedMap processPixel continuous


commandsForm : (BLOptCode -> msg) -> BLOptCode -> List (Html msg)
commandsForm cmdSetter activeCmd =
    let
        picker =
            \cmd ->
                div
                    [ onClick (cmdSetter cmd)
                    , tabindex 1
                    , classList
                        [ ( "cmd-btn", True )
                        , ( "cmd-btn-active", cmd == activeCmd )
                        , ( "cmd-btn--" ++ cmd, True )
                        ]
                    ]
                    []
    in
    [ picker blCmd.shiftRight
    , picker blCmd.shiftLeft
    , picker blCmd.increment
    , picker blCmd.decrement
    , picker blCmd.ioWrite
    , picker blCmd.ioRead
    , picker blCmd.loopOpen
    , picker blCmd.loopClose
    , picker blCmd.rotateClockwise
    , picker blCmd.rotateCounterClockwise
    ]
