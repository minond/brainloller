module Brainloller.Pixel exposing (programForm)

import Brainloller.Lang exposing (BLProgram, Pixel)
import Collage exposing (Form, filled, move, square)
import Color exposing (rgb)


type alias BoardConfig =
    { cellSize : Int
    , width : Int
    , startX : Int
    , startY : Int
    }


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
    move point (filled color (square 20))


programForm : BLProgram -> List Form
programForm program =
    let
        cellSize =
            20

        height =
            List.length program

        width =
            case List.head program of
                Just row ->
                    List.length row

                Nothing ->
                    0

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
