module Brainloller.Pixel exposing (Pixel, Pixels, pixelsForm)

import Collage exposing (Form, filled, move, square)
import Color exposing (rgb)


type alias Pixel =
    { r : Int
    , g : Int
    , b : Int
    }


type alias Pixels =
    List (List Pixel)


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


pixelsForm : Pixels -> List Form
pixelsForm pixels =
    let
        cellSize =
            20

        height =
            List.length pixels

        width =
            case List.head pixels of
                Just row ->
                    List.length row

                Nothing ->
                    0

        startX =
            width // 2 * cellSize

        startY =
            height // 2 * cellSize * -1

        continuous =
            List.foldl (++) [] pixels

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
