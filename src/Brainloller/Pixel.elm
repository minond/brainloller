module Brainloller.Pixel exposing (commandsForm, programForm)

import Brainloller.Lang exposing (BLProgram, Pixel, blCmd, blCmdPixel)
import Collage exposing (Form, filled, move, square)
import Color exposing (Color, rgb)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Maybe


type alias BoardConfig =
    { cellSize : Int
    , width : Int
    , startX : Int
    , startY : Int
    }


pixelColor : Pixel -> Color
pixelColor { r, g, b } =
    rgb r g b


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


commandsForm : (String -> msg) -> Html msg
commandsForm cmdSetter =
    let
        picker =
            \cmd ->
                div
                    [ onClick (cmdSetter cmd)
                    , classList
                        [ ( "program-command", True )
                        , ( "program-command--" ++ cmd, True )
                        ]
                    ]
                    []
    in
    div [ class "cf" ]
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
