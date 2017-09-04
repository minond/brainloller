module Main exposing (..)

import Html exposing (Html, beginnerProgram, div, text, h1, node, p)
import Html.Attributes exposing (href, rel)
import Tachyons exposing (classes, tachyons)
import Tachyons.Classes exposing (cf, pa3, pa4_ns, mt0, f3, f2_m, f1_l, fw1, baskerville, lh_copy, helvetica)


main =
    beginnerProgram { model = 0, view = view, update = update }


stylesheet : String -> Html msg
stylesheet url =
  node "link"
    [ rel "stylesheet"
    , href url
    ]
    []


mainTitle : String -> Html msg
mainTitle title =
  h1 [ classes [ mt0, f3, f2_m, f1_l, fw1, baskerville ] ]
    [ text title ]


textCopy : String -> Html msg
textCopy copy =
  p [ classes [ lh_copy, helvetica ] ]
    [ text copy ]



view model =
    div [ classes [ cf, pa3, pa4_ns, "container" ] ]
        [ stylesheet "/node_modules/tachyons/css/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , mainTitle "Brainloller"
        , textCopy "Brainloller is a Brainfuck clone designed by Lode Vandevenne in 2005. Commands are read from the pixels of a .png image (like Piet), with 2 extra commands. The extra commands change the instruction pointer direction so that you can compact the 1D Brainfuck code into a 2D image. You can hide Brainloller code in a photo or draw comments."
        ]


type Msg
    = Increment
    | Decrement


update msg model =
    case msg of
        Increment ->
            model + 1

        Decrement ->
            model - 1
