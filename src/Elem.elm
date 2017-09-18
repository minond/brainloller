module Elem exposing (cmdBtn, link, mainTitle, stylesheet, textCopy)

import Html exposing (Attribute, Html, a, div, h1, img, node, p, text)
import Html.Attributes exposing (class, href, rel, src, tabindex, target, title)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Util exposing (ternary)


link : String -> String -> Bool -> Html msg
link label to external =
    a
        [ href to
        , target (ternary external "_blank" "_self")
        , classes
            [ Tac.link
            , Tac.dim
            , Tac.blue
            ]
        ]
        [ text label ]


cmdBtn : String -> String -> List (Attribute msg) -> Html msg
cmdBtn label imgSrc attrs =
    div (title label :: tabindex 1 :: class "cmd-btn" :: attrs)
        [ img
            [ src imgSrc ]
            []
        ]


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


textCopy : List (Html msg) -> Html msg
textCopy copy =
    let
        pClasses =
            [ Tac.lh_copy
            , Tac.helvetica
            ]
    in
    p
        [ classes pClasses ]
        copy
