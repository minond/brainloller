module Main exposing (main)

import Canvas exposing (Canvas, DrawImageParams(..), DrawOp(..), Error, Point, Size)
import Collage exposing (collage, toForm)
import Element exposing (Element, image, toHtml)
import Html exposing (Html, div, h1, node, p, text)
import Html.Attributes exposing (class, href, rel)
import Tachyons exposing (classes, tachyons)
import Tachyons.Classes exposing (baskerville, cf, f1_l, f2_m, f3, fw1, helvetica, lh_copy, mt0, pa3, pa4_ns)
import Task


main =
    Html.program
        { init = ( Loading, loadCode )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type Msg
    = ImageLoaded (Result Error Canvas)


type Model
    = GotCanvas Canvas Int
    | Loading


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model ) of
        ( ImageLoaded (Ok canvas), _ ) ->
            let
                size =
                    300
            in
            ( GotCanvas canvas size, Cmd.none )

        _ ->
            ( Loading, loadCode )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"
    in
    div [ classes [ cf, pa3, pa4_ns, "container" ] ]
        [ stylesheet "/build/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , title
        , codeEditor model
        ]


codeEditor : Model -> Html Msg
codeEditor model =
    case model of
        Loading ->
            textCopy "Loading code"

        GotCanvas canvas size ->
            let
                draw =
                    Scaled (Point 0 0) (Size size size)
                        |> DrawImage canvas
            in
            div [ class "canvas-container" ]
                [ Canvas.initialize (Size size size)
                    |> Canvas.draw draw
                    |> Canvas.toHtml []
                ]


loadCode : Cmd Msg
loadCode =
    Task.attempt
        ImageLoaded
        (Canvas.loadImage "brainloller/helloworldlarge.png")


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
