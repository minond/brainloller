module Main exposing (..)

import Collage exposing (collage, toForm)
import Element exposing (Element, toHtml, image)
import Html exposing (Html, div, h1, node, p, text)
import Html.Attributes exposing (href, rel, class)
import Tachyons exposing (classes, tachyons)
import Tachyons.Classes exposing (baskerville, cf, f1_l, f2_m, f3, fw1, helvetica, lh_copy, mt0, pa3, pa4_ns)


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { url : String
    }


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


init : ( Model, Cmd msg )
init =
    ( Model "brainloller/helloworldlarge.png", Cmd.none )


update : msg -> Model -> ( Model, Cmd msg )
update _ model =
    ( model, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


view : Model -> Html msg
view model =
    let
        title =
            mainTitle "Brainloller"

        intro =
            textCopy "Brainloller is a Brainfuck clone designed by Lode Vandevenne in 2005. Commands are read from the pixels of a .png image (like Piet), with 2 extra commands. The extra commands change the instruction pointer direction so that you can compact the 1D Brainfuck code into a 2D image. You can hide Brainloller code in a photo or draw comments."

        canvas =
            collage 300 300 [ toForm (image 300 300 model.url) ]
    in
    div [ classes [ cf, pa3, pa4_ns, "container" ] ]
        [ stylesheet "/build/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , title
        , intro
        , div [ class "canvas-container" ] [ toHtml canvas ]
        ]
