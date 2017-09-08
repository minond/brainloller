module Main exposing (main)

import Array
import Collage exposing (collage)
import Debug
import Dict
import Element exposing (Element, image, toHtml)
import Html exposing (Attribute, Html, button, div, h1, node, p, text)
import Html.Attributes exposing (class, href, rel)
import Html.Events exposing (onClick)
import List
import Pixel exposing (pixelsForm)
import Program exposing (progHelloWorld)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


type Msg
    = Start


type Model
    = Loading
    | DrawHelloWorld


commands =
    Dict.fromList
        [ ( ">", ( 255, 0, 0 ) ) -- red
        , ( "<", ( 128, 0, 0 ) ) -- dark red
        , ( "+", ( 0, 255, 0 ) ) -- green
        , ( "-", ( 0, 128, 0 ) ) -- dark green
        , ( ".", ( 0, 0, 255 ) ) -- blue
        , ( ",", ( 0, 0, 128 ) ) -- dark blue
        , ( "[", ( 255, 255, 0 ) ) -- yellow
        , ( "]", ( 128, 128, 0 ) ) -- dark yellow
        , ( "+90", ( 0, 255, 255 ) ) -- cyan
        , ( "-90", ( 0, 128, 128 ) ) -- dark cyan
        ]


main =
    Html.program
        { init = ( DrawHelloWorld, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model ) of
        ( Start, _ ) ->
            Debug.log "Start"
                ( model, Cmd.none )


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
    let
        size =
            1000
    in
    case model of
        Loading ->
            textCopy "Processing image"

        DrawHelloWorld ->
            let
                startBtn =
                    btn [ onClick Start ]
                        [ text "Start" ]

                pixels =
                    progHelloWorld
            in
            div
                [ class Tac.tc ]
                [ startBtn
                , toHtml (collage size size (pixelsForm pixels))
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
