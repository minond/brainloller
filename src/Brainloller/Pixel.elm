module Brainloller.Pixel exposing (commandsForm, programForm)

import Brainloller.Lang exposing (BLProgram, Pixel, cmdPixel)
import Collage exposing (Form, filled, move, square)
import Color exposing (Color, rgb)
import Html exposing (Html, div, text)
import Maybe


type alias BoardConfig =
    { cellSize : Int
    , width : Int
    , startX : Int
    , startY : Int
    }


pixelColor : Pixel -> Color
pixelColor pixel =
    rgb pixel.r pixel.g pixel.b


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



-- [ move (0, 0) <| filled (pixelColor cmdPixel.shiftRight) (square 30)
-- ]


commandsForm : Html a
commandsForm =
    div []
        [ text "Controls go here" ]
