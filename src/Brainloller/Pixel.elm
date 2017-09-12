module Brainloller.Pixel exposing (commandsForm, programCells, programDimensions, programForm, setCellAt)

import Brainloller.Lang exposing (BLOptCode, BLProgram, Pixel, blCmd, blCmdPixel)
import Collage exposing (Form, filled, move, square)
import Color exposing (Color, rgb)
import Html exposing (Html, div, table, td, text, tr)
import Html.Attributes exposing (class, classList, style)
import Html.Events exposing (onClick)
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
    getAt x (asList (getAt y program))
        |> Maybe.withDefault
            { r = 255, g = 255, b = 255 }


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


programCells : Int -> Int -> BLProgram -> (Int -> Int -> msg) -> Html msg
programCells width height program clickHandler =
    div [ class "program-rows" ] <|
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
                                , onClick (clickHandler cellIndex rowIndex)
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


commandsForm : (BLOptCode -> msg) -> BLOptCode -> Html msg
commandsForm cmdSetter activeCmd =
    let
        picker =
            \cmd ->
                div
                    [ onClick (cmdSetter cmd)
                    , classList
                        [ ( "program-command", True )
                        , ( "program-command-active", cmd == activeCmd )
                        , ( "program-command--" ++ cmd, True )
                        ]
                    ]
                    []
    in
    div [ class "program-commands-container" ]
        [ table
            []
            [ tr
                []
                [ td
                    []
                    [ div
                        [ classList
                            [ ( "program-active-command", True )
                            , ( "program-active-command--" ++ activeCmd, True )
                            ]
                        ]
                        []
                    ]
                , td
                    []
                    [ div
                        [ class "program-commands" ]
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
                    ]
                ]
            ]
        ]
