module Main exposing (main)

import Canvas exposing (Canvas, DrawImageParams(..), DrawOp(..), Error, Point, Size)
import Collage exposing (collage, toForm)
import Debug
import Element exposing (Element, image, toHtml)
import Html exposing (Html, Attribute, div, h1, node, p, text, button)
import Html.Attributes exposing (class, href, rel)
import Html.Events exposing (onClick)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Task


type Msg
    = ImageLoaded (Result Error Canvas)
    | Start
    | Stop


type Model
    = GotCanvas Canvas Int
    | Loading


main =
    Html.program
        { init = ( Loading, loadCode )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model ) of
        ( ImageLoaded (Ok canvas), _ ) ->
            let
                size =
                    300
            in
            ( GotCanvas canvas size, Cmd.none )

        ( Start, _ ) ->
            Debug.log "Start"
            ( model, Cmd.none )

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

        containerClasses =
            [ "container"
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
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

                startBtn =
                    btn [ onClick Start ]
                        [ text "Start" ]
            in
            div [ class Tac.tc ]
                [ startBtn
                , Canvas.initialize (Size size size)
                    |> Canvas.draw draw
                    |> Canvas.toHtml []
                ]


btn : List (Attribute msg) -> List (Html msg) -> Html msg
btn attrs =
    let
        classList =
            [ "monospace"
            , Tac.f6
            , Tac.link
            , Tac.dim
            , Tac.ba
            , Tac.ph3
            , Tac.pv2
            , Tac.dib
            , Tac.black
            , Tac.ttu
            , Tac.bg_white
            , Tac.courier
            ]
    in
    button (classes classList :: attrs)


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
    let
        h1Classes =
            [ Tac.mt0
            , Tac.f3
            , Tac.f2_m
            , Tac.f1_l
            , Tac.fw1
            , Tac.baskerville
            ]
    in
    h1 [ classes h1Classes ]
        [ text title ]


textCopy : String -> Html msg
textCopy copy =
    let
        pClasses =
            [ Tac.lh_copy
            , Tac.helvetica
            ]
    in
    p [ classes pClasses ]
        [ text copy ]
